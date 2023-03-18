const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { getOctokit, context } = require('@actions/github');
const core = require('@actions/core');

const readFile = promisify(fs.readFile);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const isGitLab = process.env.CI_PROJECT_URL
  ? process.env.CI_PROJECT_URL.includes('gitlab.com')
  : false;

async function addReviewToGitHub(reviews) {
  const githubToken = process.env.GITHUB_TOKEN;
  const octokit = getOctokit(githubToken);
  // const context = context
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
  });

  for (const [file, review] of Object.entries(reviews)) {
    let lastCommitSha;

    for (const commit of commits) {
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: commit.sha,
      });
      const changedFile = commitData.files.find((f) => f.filename === file);
      if (changedFile) {
        console.log(`Changed file found: ${changedFile.filename}`);
        lastCommitSha = commit.sha;
        break;
      }
    }

    if (lastCommitSha) {
      const reviewComment = `${review}\n`;

      const { data: diff } = await octokit.rest.repos.getCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: lastCommitSha,
      });

      const changedFile = diff.files.find((f) => f.filename === file);
      const position = changedFile.patch.split('\n').length - 1;

      await octokit.rest.pulls.createReviewComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        commit_id: lastCommitSha,
        body: `**File: ${file}**\n\n${reviewComment}`,
        path: file,
        position: position,
      });
    }
  }
}

async function findLastCommitForFile(projectId, mergeRequestId, file) {
  const gitlabApiToken = process.env.GITLAB_API_TOKEN;
  const gitlabApiUrl = `https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}/commits`;

  const headers = {
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': gitlabApiToken,
  };

  try {
    const response = await axios.get(gitlabApiUrl, { headers: headers });
    const commits = response.data;

    for (const commit of commits) {
      const commitDetails = await axios.get(
        `https://gitlab.com/api/v4/projects/${projectId}/repository/commits/${commit.id}/diff`,
        { headers: headers },
      );

      const changedFile = commitDetails.data.find(
        (diff) => diff.new_path === file || diff.old_path === file,
      );

      if (changedFile) {
        return commit.id;
      }
    }
  } catch (error) {
    console.error('Error while fetching GitLab commits:', error);
    throw error;
  }

  return null;
}

async function addReviewToGitLab(reviews) {
  const projectId = process.env.CI_PROJECT_ID;
  const mergeRequestId = process.env.CI_MERGE_REQUEST_IID;

  for (const [file, review] of Object.entries(reviews)) {
    const lastCommitSha = await findLastCommitForFile(
      projectId,
      mergeRequestId,
      file,
    );

    if (lastCommitSha) {
      const reviewComment = `**File: ${file}**\n\n${review}\n`;
      createGitLabComment(
        projectId,
        mergeRequestId,
        reviewComment,
        lastCommitSha,
      )
        .then(() => console.log('Comment added to GitLab Merge Request'))
        .catch((error) => {
          console.error(
            'Failed to add comment to GitLab Merge Request:',
            error,
          );
          process.exit(1);
        });
    }
  }
}

async function createGitLabComment(
  projectId,
  mergeRequestId,
  comment,
  commitSha,
) {
  const gitlabApiToken = process.env.GITLAB_API_TOKEN;
  const gitlabApiUrl = `https://gitlab.com/api/v4/projects/${projectId}/merge_requests/${mergeRequestId}/notes`;

  const headers = {
    'Content-Type': 'application/json',
    'PRIVATE-TOKEN': gitlabApiToken,
  };

  const body = JSON.stringify({
    body: comment,
    position: {
      base_sha: commitSha,
      start_sha: commitSha,
      head_sha: commitSha,
      position_type: 'text',
      new_path: '',
      new_line: null,
    },
  });

  try {
    const response = await axios.post(gitlabApiUrl, body, {
      headers: headers,
    });
    return response;
  } catch (error) {
    console.error('Error while posting GitLab comment:', error);
    throw error;
  }
}

class ReviewPlatform {
  constructor(platform) {
    this.platform = platform;
  }

  async addReview(reviews) {
    if (this.platform === 'github') {
      return addReviewToGitHub(reviews);
    } else if (this.platform === 'gitlab') {
      return addReviewToGitLab(reviews);
    } else {
      throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }
}

async function main() {
  const projectRoot = process.cwd();
  const files = process.argv.slice(2);
  const reviews = {};

  // 코드리뷰 생성
  for (const file of files) {
    const code = await readFile(file, 'utf-8');
    const prompt = `Please review the following TypeScript code:\n\n${code}\n`;

    const chatMessages = [
      {
        role: 'system',
        content:
          'As a code reviewer, I am focusing on identifying structural improvements and duplicated code in TypeScript, particularly within the context of the NestJS framework. My goal is to provide a review that highlights best practices and potential areas of improvement, ultimately enhancing the overall quality of your project. In addition to this, I will also emphasize on the abstraction aspect of your code, ensuring that your application is modular and follows the principles of encapsulation and separation of concerns. Once you provide your code, I will offer feedback on structural improvements, duplicated code, and abstraction tailored to your specific implementation. Please paste your code below. Lastly, please note that the review will be provided in Korean.',
      },
      { role: 'user', content: prompt },
    ];
    const completions = await openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        temperature: 0.7,
      },
      {
        timeout: 120000 * 2,
        maxBodyLength: 8192 * 2,
      },
    );

    const review = completions.data.choices[0].message.content;
    const relativeFilePath = path.relative(projectRoot, file);
    reviews[relativeFilePath] = review;
  }

  const platform = isGitLab ? 'gitlab' : 'github';
  const reviewPlatform = new ReviewPlatform(platform);

  reviewPlatform
    .addReview(reviews)
    .then(() =>
      console.log(`Comment added to ${platform.toUpperCase()}Merge Request`),
    )
    .catch((error) => {
      console.error(
        `Failed to add comment to ${platform.toUpperCase()} Merge Request:`,
        error,
      );
      process.exit(1);
    });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

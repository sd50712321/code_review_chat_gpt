import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import { getOctokit, context } from '@actions/github';

const readFile = promisify(fs.readFile);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const isGitLab: boolean = process.env.CI_PROJECT_URL
  ? process.env.CI_PROJECT_URL.includes('gitlab.com')
  : false;
export function getContext() {
  return context;
}

export async function addReviewToGitHub(
  reviews: Record<string, string>,
): Promise<void> {
  const githubToken = process.env.GITHUB_TOKEN;
  const octokit = getOctokit(githubToken);

  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner: getContext().repo.owner,
    repo: getContext().repo.repo,
    pull_number: getContext().issue.number,
  });

  for (const [file, review] of Object.entries(reviews)) {
    let lastCommitSha: string | undefined;

    for (const commit of commits) {
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner: getContext().repo.owner,
        repo: getContext().repo.repo,
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
        owner: getContext().repo.owner,
        repo: getContext().repo.repo,
        ref: lastCommitSha,
      });

      const changedFile = diff.files.find((f) => f.filename === file);
      const position = changedFile.patch.split('\n').length - 1;

      await octokit.rest.pulls.createReviewComment({
        owner: getContext().repo.owner,
        repo: getContext().repo.repo,
        pull_number: getContext().issue.number,
        commit_id: lastCommitSha,
        body: `**File: ${file}**\n\n${reviewComment}`,
        path: file,
        position: position,
      });
    }
  }
}

export async function findLastCommitForFile(
  projectId: string,
  mergeRequestId: string,
  file: string,
): Promise<string | null> {
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

export async function addReviewToGitLab(
  reviews: Record<string, string>,
): Promise<void> {
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

export async function createGitLabComment(
  projectId: string,
  mergeRequestId: string,
  comment: string,
  commitSha: string,
): Promise<any> {
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
  platform: string;

  constructor(platform: string) {
    this.platform = platform;
  }

  async addReview(reviews: Record<string, string>): Promise<void> {
    if (this.platform === 'github') {
      return addReviewToGitHub(reviews);
    } else if (this.platform === 'gitlab') {
      return addReviewToGitLab(reviews);
    } else {
      throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }
}

export async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const files = process.argv.slice(2);
  const reviews: Record<string, string> = {};

  for (const file of files) {
    const code = await readFile(file, 'utf-8');
    const prompt = `Please review the following TypeScript code:\n\n${code}\n`;
    const chatMessages: Array<ChatCompletionRequestMessage> = [
      {
        role: 'system',
        content:
          'As a code reviewer, I am focusing on identifying structural improvements, duplicated code, and naming conventions in TypeScript, particularly within the context of the NestJS framework. My goal is to provide a review that highlights best practices and potential areas of improvement, ultimately enhancing the overall quality of your project. In addition to this, I will also emphasize the abstraction aspect of your code, ensuring that your application is modular and follows the principles of encapsulation and separation of concerns.\nOnce you provide your code, I will offer feedback on structural improvements, duplicated code, naming conventions, and abstraction tailored to your specific implementation. I will also include the line numbers of the problematic areas in my review for better clarity. Please paste your code below. Lastly, please note that the review will be provided in English.',
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
      console.log(`Comment added to ${platform.toUpperCase()} Merge Request`),
    )
    .catch((error) => {
      console.error(
        `Failed to add comment to ${platform.toUpperCase()} Merge Request:`,
        error,
      );
      process.exit(1);
    });
}

main();

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { github } = require('@actions/github');
const core = require('@actions/core');

const readFile = promisify(fs.readFile);

async function addReviewToGitHub(reviews) {
  const githubToken = core.getInput('github-token');
  const octokit = github.getOctokit(githubToken);
  const context = github.context;
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

async function addReviewToGitLab(reviews) {
  const projectId = process.env.CI_PROJECT_ID;
  const mergeRequestId = process.env.CI_MERGE_REQUEST_IID;
  const reviewText = Object.entries(JSON.parse(reviews))
    .map(([file, review]) => `## File: ${file}\n\n${review}`)
    .join('\n\n');
  const reviewComment = `Code Review 결과:\n\n${reviewText}\n`;
  createGitLabComment(projectId, mergeRequestId, reviewComment)
    .then(() => console.log('Comment added to GitLab Merge Request'))
    .catch((error) => {
      console.error('Failed to add comment to GitLab Merge Request:', error);
      process.exit(1);
    });
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
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
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
          'As a code reviewer, I am focusing on identifying structural improvements and duplicated code in TypeScript, particularly within the context of the NestJS framework. My goal is to provide a review that highlights best practices and potential areas of improvement, ultimately enhancing the overall quality of your project. Once you provide your code, I will offer feedback on structural improvements and duplicated code tailored to your specific implementation. Please paste your code below. Lastly, please note that the review will be provided in korean.',
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

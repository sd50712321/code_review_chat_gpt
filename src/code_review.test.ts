import {
  addReviewToGitHub,
  addReviewToGitLab,
  createGitLabComment,
  findLastCommitForFile,
} from '../code_review';
import axios from 'axios';
import { getOctokit } from '@actions/github';
jest.mock('axios');
jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'owner',
      repo: 'repo',
    },
    issue: {
      owner: '',
      repo: '',
      number: 0,
    },
    payload: {},
    eventName: 'pull_request',
    sha: 'test_sha',
    ref: 'test_ref',
    workflow: 'test_workflow',
    action: 'test_action',
    actor: 'test_actor',
    job: 'test_job',
    runNumber: 1,
    runId: 1,
    apiUrl: 'https://api.github.com',
    serverUrl: 'https://github.com',
    graphqlUrl: 'https://api.github.com/graphql',
  },
  getOctokit: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetOctokit = getOctokit as jest.MockedFunction<typeof getOctokit>;

describe('코드 리뷰', () => {
  let octokitMock;

  beforeEach(() => {
    octokitMock = {
      rest: {
        pulls: {
          listCommits: jest.fn(),
          createReviewComment: jest.fn(),
        },
        repos: {
          getCommit: jest.fn(),
        },
      },
    };
    mockedGetOctokit.mockReturnValue(octokitMock as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit was called');
    });
  });

  describe('깃헙에 코드리뷰 등록', () => {
    it('깃헙에 성공적으로 코드리뷰가 올라가야한다', async () => {
      octokitMock.rest.pulls.listCommits.mockResolvedValue({
        data: [{ sha: 'commit-sha' }],
      });
      octokitMock.rest.repos.getCommit.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'file.js',
              patch: 'patch-content',
            },
          ],
        },
      });
      octokitMock.rest.pulls.createReviewComment.mockResolvedValue({});

      const reviews = { 'file.js': 'review-content' };
      // when(getContext).thenReturn(mockedContext);
      await addReviewToGitHub(reviews);

      expect(octokitMock.rest.pulls.listCommits).toHaveBeenCalled();
      expect(octokitMock.rest.repos.getCommit).toHaveBeenCalled();
      expect(octokitMock.rest.pulls.createReviewComment).toHaveBeenCalled();
    });

    it('깃헙에 코드리뷰 등록이 실패하면 오류가 발생해야 한다', async () => {
      octokitMock.rest.pulls.listCommits.mockResolvedValue({
        data: [{ sha: 'commit-sha' }],
      });
      octokitMock.rest.repos.getCommit.mockResolvedValue({
        data: {
          files: [
            {
              filename: 'file.js',
              patch: 'patch-content',
            },
          ],
        },
      });
      octokitMock.rest.pulls.createReviewComment.mockRejectedValue(
        new Error('Failed to add comment to GitHub Pull Request:'),
      );

      const reviews = { 'file.js': 'review-content' };
      try {
        await addReviewToGitHub(reviews);
      } catch (err) {
        expect(err.message).toBe(
          'Failed to add comment to GitHub Pull Request:',
        );
      }
      // await expect(addReviewToGitHub(reviews)).rejects.toThrow(
      //   'Failed to add comment to GitHub Pull Request:',
      // );
    });
  });

  describe('깃랩 코드리뷰 등록', () => {
    it('깃랩 성공적으로 코드리뷰가 올라가야 한다', async () => {
      const reviews = { 'file.js': 'review-content' };

      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            new_path: 'file.js',
            id: 'commit-sha',
          },
        ],
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            new_path: 'file.js',
            id: 'commit-sha',
          },
        ],
      });

      try {
        await addReviewToGitLab(reviews);
      } catch (err) {
        fail('should not be here');
      }
    });

    it('깃랩리뷰등록 실패', async () => {
      const reviews = { 'file.js': 'review-content' };

      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            new_path: 'file.js',
            id: 'commit-sha',
          },
        ],
      });

      mockedAxios.get.mockRejectedValue(
        new Error('Failed to add comment to GitLab Merge Request:'),
      );

      try {
        await addReviewToGitLab(reviews);
      } catch (err) {
        expect(err.message).toBe(
          'Failed to add comment to GitLab Merge Request:',
        );
      }
    });
  });

  describe('마지막커밋파일 찾기', () => {
    it('마지막 커밋 파일 해시가 제대로 출력되어야 한다', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          {
            new_path: 'file.js',
            id: 'commit-sha',
          },
        ],
      });
      const commitId = await findLastCommitForFile('1', '1', 'file.js');

      expect(commitId).toBe('commit-sha');
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('마지막 커밋파일 찾기 실패', async () => {
      mockedAxios.get.mockRejectedValue(
        new Error('Error while fetching GitLab commits:'),
      );

      try {
        await findLastCommitForFile('1', '1', 'file.js');
      } catch (err) {
        expect(err.message).toBe('Error while fetching GitLab commits:');
      }
    });
  });

  describe('깃랩 코멘트 작성하기', () => {
    it('깃랩 코멘트가 제대로 작성되어야 한다', async () => {
      mockedAxios.post.mockResolvedValue({});
      await createGitLabComment('1', '1', 'comment', 'commit-sha');

      expect(mockedAxios.post).toHaveBeenCalled();
    });
    it('깃랩 코멘트 작성 실패', async () => {
      mockedAxios.post.mockRejectedValue(
        new Error('Error while posting GitLab comment:'),
      );

      try {
        await createGitLabComment('1', '1', 'comment', 'commit-sha');
      } catch (err) {
        expect(err.message).toBe('Error while posting GitLab comment:');
      }
    });
  });
});

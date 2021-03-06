import {writeFileSync} from 'fs';
import path from 'path';

import {GitBranch} from '../../src/preconditions';
import {TestGitRepo} from '../test-utils';

let repo: TestGitRepo;

beforeEach(async () => {
    repo = await TestGitRepo.create('TestPreconditionGitBranch');
    writeFileSync(path.resolve(repo.directory, 'test.txt'), 'This is a test file!');
    return repo.git.addAndCommit('Initial commit');
});

describe('GitBranch with string', () => {
    it('should work on correct branch', () => {
        const precondition = GitBranch('main');
        return expect(precondition(repo.context())).resolves.toBe(undefined);
    });

    it('should not work on wrong branch', () => {
        const precondition = GitBranch('test');

        return expect(precondition(repo.context()))
            .rejects.toHaveProperty('message', 'Expected branch "test" but got "main"!');
    });
});

describe('GitBranch with RegExp', () => {
    it('should work on correct branch', async () => {
        await repo.git.simpleGit.checkout(['-b', 'v1.0']);

        const precondition = GitBranch(/^v[0-9]+\.[0-9]+$/);
        return expect(precondition(repo.context())).resolves.toBe(undefined);
    });

    it('should not work on wrong branch', () => {
        const precondition = GitBranch(/^v[0-9]+\.[0-9]+$/);

        return expect(precondition(repo.context()))
            .rejects
            .toHaveProperty('message', 'Current branch "main" does not match pattern "/^v[0-9]+\\.[0-9]+$/"!');
    });
});

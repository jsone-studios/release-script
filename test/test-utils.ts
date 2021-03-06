import {existsSync, readdirSync, mkdirSync} from 'fs';
import path from 'path';

import rimraf from 'rimraf';
import SemVer from 'semver/classes/semver';
import simplegit from 'simple-git';

import {GitImpl} from '../src/git';
import type {ReleaseContext, Git} from '../src/types';
import {ReleaseContextImpl} from '../src/release-context';

const DEFAULT_REPO_FOLDER = './test-temp';

export function createTestDirectory(name: string): string {
    const directory = path.resolve(DEFAULT_REPO_FOLDER, name);
    if (existsSync(directory)) {
        for (const file of readdirSync(directory)) {
            //console.log(`Deleting: ${path.resolve(this._directory, file)}`);
            rimraf.sync(path.resolve(directory, file));
        }
    }
    else {
        mkdirSync(directory, {recursive: true});
    }
    return directory;
}

export class TestGitRepo {

    constructor(
        private _directory: string,
        private _git: GitImpl,
    ) {}

    static async create(name: string): Promise<TestGitRepo> {
        const directory = createTestDirectory(name);
        const simpleGit = simplegit(directory);
        await simpleGit.init();
        // Newer git installation might use 'main' as default branch name, 
        // therefore we hardcode 'main' as our default branch name
        // Also see https://stackoverflow.com/a/42871621/4508716
        await simpleGit.checkout(['-b', 'main']);
        await simpleGit.addConfig('user.name', 'Test Executor');
        await simpleGit.addConfig('user.email', 'test@test.com');
        const gitImpl = new GitImpl(simpleGit);
        return new TestGitRepo(directory, gitImpl);
    }

    context(version = new SemVer('1.0.0'), config = {}, isNextDevVersion = false): ReleaseContext {
        return new ReleaseContextImpl(this._directory, version, config, this._git, isNextDevVersion);
    }

    get git(): GitImpl {
        return this._git;
    }

    get directory(): string {
        return this._directory;
    }
}

export function createReleaseContext(
    directory = '', version = new SemVer('1.0.0'), config = {}, isNextDevVersion = false,
): ReleaseContext {
    const git = {} as Git;
    return new ReleaseContextImpl(directory, version, config, git, isNextDevVersion);
}

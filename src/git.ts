// eslint-disable-next-line import/default
import simplegit from 'simple-git/promise';
import {DefaultLogFields} from 'simple-git/typings/response';

export class Git {

    constructor(private git: simplegit.SimpleGit) {}

    static openRepo(path: string): Git {
        return new Git(simplegit(path));
    }

    status(): Promise<simplegit.StatusResult> {
        return this.git.status();
    }

    revParse(options?: string[]): Promise<string> {
        return this.git.revparse(options);
    }

    async getCurrentBranchName(): Promise<string> {
        try {
            return await this.revParse(['--abbrev-ref', 'HEAD']);
        }
        catch (error) {
            throw new Error('Failed to get current git branch name');
        }
    }

    async tags(): Promise<string[]> {
        const tags = await this.git.tags();
        return tags.all;
    }

    async addAndCommit(message: string): Promise<void> {
        const status = await this.status();
        if (status.isClean()) {
            return;
        }
        await this.git.add('.');
        try {
            await this.commit(message);
            return;
        }
        catch (err) {
            return Promise.reject(err);
        }
    }

    commit(message: string, files?: string|string[]): Promise<simplegit.CommitSummary> {
        return this.git.commit(message, files);
    }

    async tag(tagName: string, tagMessage?: string): Promise<void> {
        if (tagMessage) {
            return this.git.addAnnotatedTag(tagName, tagMessage);
        }
        await this.git.addTag(tagName);
    }

    async getLatestCommit(): Promise<DefaultLogFields> {
        const log = await this.git.log([-1]);
        return log.latest;
    }

    push(): Promise<void> {
        return this.git.push();
    }

    get simpleGit(): simplegit.SimpleGit {
        return this.git;
    }
}
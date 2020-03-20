import path from 'path';

import semver from 'semver';

import {ReleaseConfigOptions} from '../declarations/ReleaseConfigOptions';

import {Git} from './git';
import {validate} from './validate';
import {checkPreconditions} from './precondition';
import {ReleaseContext} from './release-context';
import {executeReleaseHooks} from './release-hook';
import {executeVersionHooks} from './version-hook';

export class ReleaseScript {
    constructor(private releaseConfig: ReleaseConfigOptions = {}) {
        validate(releaseConfig);
    }

    public async release(newVersionString: string, directory = '.'): Promise<void> {
        const newVersion = semver.parse(newVersionString);
        if (newVersion === null) {
            console.log(`New version does not follow the semantic version specification: ${newVersion}`);
            return;
        }

        const git = Git.openRepo(path.resolve(directory));
        const context = new ReleaseContext(git, newVersion, this.releaseConfig);

        await checkPreconditions(context);
        await executeVersionHooks(context);
        await context.git.addAndCommit(`Release version ${context.version} [CI SKIP]`);
        await context.doGitTag();
        await executeReleaseHooks(context);

        const nextContext = context.getNextContext();
        if (nextContext !== null) {
            await executeVersionHooks(nextContext);
            await nextContext.git.addAndCommit('Prepare next release [CI SKIP]');
        }

        await context.doGitPush();
        console.log('Finished release!');
    }
}

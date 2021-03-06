import {writeFile as writeFileCallback, readFile as readFileCallback} from 'fs';
import {promisify} from 'util';
import {resolve} from 'path';

import type {ReleaseContext, VersionFunction} from '../types';

const writeFile = promisify(writeFileCallback);
const readFile = promisify(readFileCallback);

function defaultReleaseHeader(context: ReleaseContext): Promise<string> {
    return Promise.resolve(`## [${context.version.version}]`);
}

export function Changelog(
    file: string,
    releaseHeader = defaultReleaseHeader,
    fileEncoding = 'utf-8',
): VersionFunction {
    async function pluginFunction(context: ReleaseContext): Promise<void> {
        if (!context.isNextDevelopmentVersion) {
            const fullFilePath = resolve(context.directory, file);
            const oldChangelog = await readFile(fullFilePath, fileEncoding);
            const lines = oldChangelog.split('\n');
            let unreleasedLineIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('Unreleased')) {
                    unreleasedLineIndex = i;
                    break;
                }
                
            }
            if (unreleasedLineIndex === -1) {
                throw new Error(`Changelog could not find 'Unreleased' header in ${file}!`);
            }
            const newVersionHeader = await releaseHeader(context);
            lines.splice(unreleasedLineIndex + 1, 0, '', newVersionHeader);

            await writeFile(fullFilePath, lines.join('\n'), fileEncoding);
        }
    }

    return pluginFunction;
}

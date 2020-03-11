import {readFileSync} from 'fs';
import path = require('path');

import semver from 'semver';

import {WriteFile} from '../../src/plugins';
import {createTestDirectory} from '../test-git-repo';

// eslint-disable-next-line
const context: any = {
    version: semver.parse('1.0.0'),
};

const testDir = createTestDirectory('TestPluginWriteFile');

describe('Plugin WriteFile', () => {
    it('write correct version', async () => {
        const file = path.resolve(testDir, 'version.txt');
        const command = new WriteFile(file);
        expect(await command.apply(context)).toBe(true);
        expect(readFileSync(file, 'utf-8')).toEqual('1.0.0');
        return null;
    });

    it('write costom content', async () => {
        const file = path.resolve(testDir, 'version.txt');
        const command = new WriteFile(file,
            ctx => `Major: ${ctx.version.major}\nMinor: ${ctx.version.minor}\nPatch: ${ctx.version.patch}\n`);
        expect(await command.apply(context)).toBe(true);
        expect(readFileSync(file, 'utf-8')).toEqual('Major: 1\nMinor: 0\nPatch: 0\n');
        return null;
    });
});

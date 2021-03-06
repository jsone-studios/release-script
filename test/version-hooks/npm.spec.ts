import {execSync} from 'child_process';
import {readFileSync} from 'fs';
import path from 'path';

import SemVer from 'semver/classes/semver';

import {NpmPackage} from '../../src/version-hooks';
import {createTestDirectory, createReleaseContext} from '../test-utils';
import type {ReleaseContext} from '../../src/types';

import {mockCommand} from './command.mock';

describe('Plugin NpmPackage', () => {
    let context: ReleaseContext;
    let testDir: string;

    beforeEach(() => {
        testDir = createTestDirectory('TestPluginNpmPackage');
        context = createReleaseContext(testDir);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates correct npm command', async () => {
        const mock = mockCommand();
       
        const plugin = NpmPackage();
        context.version = new SemVer('1.1.0');
        await plugin(context);

        const expectedCmd = 'npm --no-git-tag-version --allow-same-version version 1.1.0';
        expect(mock).toBeCalledWith(expectedCmd, undefined);
    });

    it('updates version number', async () => {
        execSync('npm init -y', {cwd: testDir});

        const plugin = NpmPackage();
        context.version = new SemVer('1.0.1');
        await plugin(context);

        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {version} = JSON.parse(readFileSync(path.resolve(testDir, 'package.json')).toString('utf-8'));
        expect(version).toEqual('1.0.1');

        return null;
    });

    it('updates to same version number', async () => {
        execSync('npm init -y', {cwd: testDir});

        const plugin = NpmPackage();
        context.version = new SemVer('1.0.0');
        await plugin(context);

        //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {version} = JSON.parse(readFileSync(path.resolve(testDir, 'package.json')).toString('utf-8'));
        expect(version).toEqual('1.0.0');

        return null;
    });
});

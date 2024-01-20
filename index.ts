import * as Commander from 'commander'
import {CreateLatestTag, Apply} from './sources/tag.js'
import {CreateReleaseWithLatest} from './sources/release.js'
import type * as Types from './sources/types.js'

const Program = new Commander.Command()

// Set options.
Program.option('--gh-token <TOKEN>', 'GitHub token', '')
	.option('--repo <REPO>', 'A GitHub repository. eg: owner/repo', '')
	.option('--ci-workspace-path <PATH>', 'A path to the CI workspace.', '')
	.option('--ci-action-path <PATH>', 'A path to the CI action.', '')

Program.parse()
const ProgramOptions: Types.ProgramOptionsType = Program.opts()

const CurrentVersion = await CreateLatestTag(ProgramOptions)
await Apply(ProgramOptions)
await CreateReleaseWithLatest(ProgramOptions, CurrentVersion)

import * as Git from 'simple-git'
import * as Semver from 'semver'
import * as Os from 'node:os'
import type * as Types from './types.js'
import {UpdateDateVersion} from './semver.js'

function CreateGitInstance(ProgramOptions: Types.ProgramOptionsType): Git.SimpleGit {
	const GitInstance = Git.simpleGit({
		baseDir: ProgramOptions.ciWorkspacePath,
		maxConcurrentProcesses: Os.cpus().length,
	})

	return GitInstance
}

async function ListTags(ProgramOptions: Types.ProgramOptionsType): Promise<Git.TagResult> {
	const GitInstance = CreateGitInstance(ProgramOptions)

	return GitInstance.tags()
}

async function CreateTag(ProgramOptions: Types.ProgramOptionsType, Tag: string) {
	const GitInstance = CreateGitInstance(ProgramOptions)

	await GitInstance.addTag(Tag)
}

export async function CreateLatestTag(ProgramOptions: Types.ProgramOptionsType) {
	const Tags = await ListTags(ProgramOptions).then(Tag => Tag)
	var UpdateVersion = ''

	if (Tags.all.length === 0 || (Tags.all.length > 0 && !Semver.valid(Tags.latest))) {
		UpdateVersion = '0.0.1'
		await CreateTag(ProgramOptions, UpdateVersion)
	}

	if (Tags.all.length > 0 && Semver.valid(Tags.latest)) {
		UpdateVersion = UpdateDateVersion(Tags.latest)
		await CreateTag(ProgramOptions, UpdateVersion)
	}

	return UpdateVersion
}

export async function Apply(ProgramOptions: Types.ProgramOptionsType) {
	const GitInstance = CreateGitInstance(ProgramOptions)
	await GitInstance.pushTags()
}

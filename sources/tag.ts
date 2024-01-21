import * as Git from 'simple-git'
import * as Semver from 'semver'
import * as Os from 'node:os'
import * as Actions from '@actions/core'
import * as Luxon from 'luxon'
import type * as Types from './types.js'
import {UpdateDateVersion} from './semver.js'
import {IsDebug} from './debug.js'

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
		UpdateVersion = UpdateDateVersion('0.0.1')
		await CreateTag(ProgramOptions, UpdateVersion)
	}

	if (Tags.all.length > 0 && Semver.valid(Tags.latest)) {
		UpdateVersion = UpdateDateVersion(Tags.latest)
		await CreateTag(ProgramOptions, UpdateVersion)
	}

	if (IsDebug(ProgramOptions)) {
		Actions.debug(`Tags: ${JSON.stringify(Tags)}`)
		Actions.debug(`UpdateVersion: ${UpdateVersion}`)
	}

	return UpdateVersion
}

export async function Apply(ProgramOptions: Types.ProgramOptionsType) {
	const GitInstance = CreateGitInstance(ProgramOptions)
	await GitInstance.pushTags()
}

async function ListCommits(ProgramOptions: Types.ProgramOptionsType) {
	const GitInstance = CreateGitInstance(ProgramOptions)
	const CommitsHistory = (await GitInstance.log(['--date=iso-strict'])).all
	return CommitsHistory
}

export async function ListCommitsContainingTag(ProgramOptions: Types.ProgramOptionsType) {
	const CommitsResults = await ListCommits(ProgramOptions)
	const Tags = await ListTags(ProgramOptions).then(Tag => Tag.all)
	const CommitsResultsFiltered = CommitsResults.filter(CommitsResult => {
		for (const Tag of Tags) {
			if (CommitsResult.refs.includes(`tag: ${Tag}`)) {
				return true
			}
		}

		return false
	})
	return CommitsResultsFiltered
}

async function SortCommitsWithTags(Commits: ReturnType<typeof ListCommitsContainingTag>) {
	const CommitsResults = await Commits
	CommitsResults.sort((CommitsResult, CommitsResultNext) => {
		if (Luxon.DateTime.fromISO(CommitsResult.date) < Luxon.DateTime.fromISO(CommitsResultNext.date)) {
			return 1
		}

		if (Luxon.DateTime.fromISO(CommitsResult.date) > Luxon.DateTime.fromISO(CommitsResultNext.date)) {
			return -1
		}

		return 0
	})

	return CommitsResults
}

async function FilterCommitsWithTagsExceptRecentTwo(Commits: ReturnType<typeof ListCommitsContainingTag>) {
	const CommitsResults = await SortCommitsWithTags(Commits)
	return CommitsResults.slice(2)
}

export async function DeleteTagsWithCommits(ProgramOptions: Types.ProgramOptionsType, Commits: ReturnType<typeof ListCommitsContainingTag>) {
	const CommitsResults = await Commits
	const FilteredCommits = await FilterCommitsWithTagsExceptRecentTwo(CommitsResults as unknown as ReturnType<typeof ListCommitsContainingTag>)
	const GitInstance = CreateGitInstance(ProgramOptions)
	for (const FilteredCommit of FilteredCommits) {
		void GitInstance.tag(['--delete', `${/(?!tag: )[0-9]+.[0-9]+.[0-9]+/.exec(FilteredCommit.refs)[0]}`])
	}
}

import * as GitHub from '@octokit/rest'
import * as Luxon from 'luxon'
import type * as Types from './types.js'

function CreateGitHubInstance(ProgramOptions: Types.ProgramOptionsType): GitHub.Octokit {
	const GitHubInstance = new GitHub.Octokit({auth: ProgramOptions.ghToken})
	return GitHubInstance
}

export async function CreateReleaseWithLatest(ProgramOptions: Types.ProgramOptionsType, Tag: string) {
	const GitHubInstance = CreateGitHubInstance(ProgramOptions)
	await GitHubInstance.repos.createRelease({
		owner: ProgramOptions.repo.split('/')[0],
		repo: ProgramOptions.repo.split('/')[1],
		tag_name: Tag,
		draft: false,
		prerelease: false,
		name: Tag
	})
}

export async function ListRelease(ProgramOptions: Types.ProgramOptionsType) {
	const GitHubInstance = CreateGitHubInstance(ProgramOptions)
	const Releases = await GitHubInstance.repos.listReleases({
		owner: ProgramOptions.repo.split('/')[0],
		repo: ProgramOptions.repo.split('/')[1]
	}).then(Release => Release.data)
	return Releases
}

async function SortReleaseExceptRecentTwo(Releases: ReturnType<typeof ListRelease>) {
	const ReleasesResults = await Releases
	ReleasesResults.sort((ReleasesResult, ReleasesResultNext) => {
		if (Luxon.DateTime.fromISO(ReleasesResult.created_at) < Luxon.DateTime.fromISO(ReleasesResultNext.created_at)) {
			return 1
		}

		if (Luxon.DateTime.fromISO(ReleasesResult.created_at) > Luxon.DateTime.fromISO(ReleasesResultNext.created_at)) {
			return -1
		}

		return 0
	})

	return ReleasesResults as unknown as ReturnType<typeof ListRelease>
}

async function DeleteRelease(ProgramOptions: Types.ProgramOptionsType, Releases: ReturnType<typeof ListRelease>) {
	const ReleasesResults = await Releases
	const GitHubInstance = CreateGitHubInstance(ProgramOptions)
	for (const ReleasesResult of ReleasesResults) {
		void GitHubInstance.repos.deleteRelease({
			owner: ProgramOptions.repo.split('/')[0],
			repo: ProgramOptions.repo.split('/')[1],
			release_id: ReleasesResult.id
		})
	}
}

async function FilterReleaseExceptRecentTwo(Releases: ReturnType<typeof ListRelease>) {
	const ReleasesResults = await Releases
	const Sorted = await SortReleaseExceptRecentTwo(ReleasesResults as unknown as ReturnType<typeof ListRelease>)
	return Sorted.slice(2)
}

export async function DeleteReleaseExceptRecentTwo(ProgramOptions: Types.ProgramOptionsType, Releases: ReturnType<typeof ListRelease>) {
	const Filtered = await FilterReleaseExceptRecentTwo(Releases)
	await DeleteRelease(ProgramOptions, Filtered as unknown as ReturnType<typeof ListRelease>)
}

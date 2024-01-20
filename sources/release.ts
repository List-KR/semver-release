import * as GitHub from '@octokit/rest'
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
		name: Tag,
	})
}

import * as Semver from 'semver'
import * as Luxon from 'luxon'

export function UpdateDateVersion(Version: string) {
	const CurrentVersion = Semver.parse(Version)
	var NewVersion = ''
	var Now = Luxon.DateTime.utc()

	// Check if the date is updated and change.
	if ((CurrentVersion.major !== Now.year) || (CurrentVersion.minor.toString() !== `${Now.month}${Now.day}`)) {
		NewVersion += `${Now.year}.`
		NewVersion += `${Now.month}${Now.day}.`
		NewVersion += '0'
	} else {
		NewVersion = `${CurrentVersion.major}.${CurrentVersion.minor}.${CurrentVersion.patch + 1}`
	}

	return NewVersion
}

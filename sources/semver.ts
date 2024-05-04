import * as Semver from 'semver'
import * as Luxon from 'luxon'

function GetDaysAfterNewYear(Now: Luxon.DateTime<true>) {
	const NewYear = Luxon.DateTime.utc(Now.year, 1, 1)
	const Days = Now.diff(NewYear, 'days').days

	return Math.floor(Days)
}

export function UpdateDateVersion(Version: string) {
	const CurrentVersion = Semver.parse(Version)
	var NewVersion = ''
	var Now = Luxon.DateTime.utc()

	// Check if the date is updated and change.
	if ((CurrentVersion.major !== Now.year) || (CurrentVersion.minor.toString() !== GetDaysAfterNewYear(Now).toString())) {
		NewVersion += `1${Now.year}.`
		NewVersion += `${GetDaysAfterNewYear(Now)}.`
		NewVersion += '0'
	} else {
		NewVersion = `${CurrentVersion.major}.${CurrentVersion.minor}.${CurrentVersion.patch + 1}`
	}

	return NewVersion
}

import test from 'ava'
import * as Luxon from 'luxon'
import {UpdateDateVersion, GetDaysAfterNewYear} from '../sources/semver.js'

test('UpdateDateVersion with current date', T => {
  const Now = Luxon.DateTime.utc()
  if (UpdateDateVersion(`1${Now.year}.${GetDaysAfterNewYear(Now)}.0`) !== '1' + Now.year + '.' + GetDaysAfterNewYear(Now) + '.1') {
    T.fail()
  }
  T.pass()
})

test('UpdateDateVersion with a past date', T => {
  const Now = Luxon.DateTime.utc()
  if (UpdateDateVersion('2020.1.0') !== `1${Now.year}.${GetDaysAfterNewYear(Now)}.0`) {
    T.fail()
  }
  T.pass()
})
/*--------------------------------------------------------------------------
 * Copyright (c) 2019-2021, Postgres.ai, Nikolay Samokhvalov nik@postgres.ai
 * All Rights Reserved. Proprietary and confidential.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 *--------------------------------------------------------------------------
 */

import { makeAutoObservable } from 'mobx'

import { Snapshot } from '@postgres.ai/shared/types/api/entities/snapshot'
import { getTextFromUnknownApiError } from '@postgres.ai/shared/utils/api'
import { GetSnapshots } from '@postgres.ai/shared/types/api/endpoints/getSnapshots'
import { CreateSnapshot } from '@postgres.ai/shared/types/api/endpoints/createSnapshot'

export type SnapshotsApi = {
  getSnapshots: GetSnapshots
  createSnapshot?: CreateSnapshot
}

type Error = {
  title?: string
  message: string
}
export class SnapshotsStore {
  data: Snapshot[] | null = null
  error: Error | null = null
  isLoading = false
  snapshotData: boolean | null = null
  snapshotDataError: Error | null = null

  private readonly api: SnapshotsApi

  constructor(api: SnapshotsApi) {
    this.api = api

    makeAutoObservable(this)
  }

  load = (instanceId: string) => {
    this.data = null
    this.error = null
    return this.loadData(instanceId)
  }

  reload = (instanceId: string) => this.loadData(instanceId)

  createSnapshot = async (cloneId: string) => {
    if (!this.api.createSnapshot || !cloneId) return

    this.snapshotDataError = null

    const { response, error } = await this.api.createSnapshot(cloneId)

    if (response) {
      this.snapshotData = !!response
      this.reload('')
    }

    if (error) {
      this.snapshotDataError = await error.json().then((err) => err)
    }

    return response
  }

  private loadData = async (instanceId: string) => {
    this.isLoading = true

    const { response, error } = await this.api.getSnapshots({ instanceId })

    this.isLoading = false

    if (response) this.data = response

    if (error) this.error = { message: await getTextFromUnknownApiError(error) }

    return !!response
  }
}

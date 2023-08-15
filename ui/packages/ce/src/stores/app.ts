import { makeAutoObservable } from 'mobx'

import { getEngine } from 'api/engine/getEngine'
import { EngineType } from '@postgres.ai/shared/types/api/endpoints/getEngine'

type EngineProp = {
  data: EngineType | null | undefined
  isLoading: boolean
}

class AppStore {
  readonly engine: EngineProp = {
    data: undefined,
    isLoading: false,
  }

  isValidAuthToken: boolean | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  loadData = async () => {
    this.engine.isLoading = true
    const { response } = await getEngine()
    this.engine.data = response
    this.engine.isLoading = false
  }

  setIsValidAuthToken = () => (this.isValidAuthToken = true)

  setIsInvalidAuthToken = () => (this.isValidAuthToken = false)
}

export const appStore = new AppStore()

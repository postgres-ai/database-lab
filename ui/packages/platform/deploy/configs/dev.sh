#--------------------------------------------------------------------------
# Copyright (c) 2019-2021, Postgres.ai, Nikolay Samokhvalov nik@postgres.ai
# All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
#--------------------------------------------------------------------------

export PORT=3000
export REPLICAS=1
export REACT_APP_API_SERVER="https://v2.postgres.ai/api/general"
export REACT_APP_WS_SERVER="wss://v2.postgres.ai/websockets"
export REACT_APP_SIGNIN_URL="https://console-dev.postgres.ai/signin"
export REACT_APP_EXPLAIN_DEPESZ_SERVER="https://explain-depesz.postgres.ai/"
export REACT_APP_EXPLAIN_PEV2_SERVER="https://v2.postgres.ai/explain-pev2/"
export REACT_APP_AUTH_URL="https://v2.postgres.ai/api/auth-dev"
export REACT_APP_ROOT_URL="https://v2.postgres.ai"
export PUBLIC_URL=""

# Public Stripe key, it is ok to keep it here.
export REACT_APP_STRIPE_API_KEY="xxx"
export REACT_APP_SENTRY_DSN=""

# AI Bot
# don't forget trailing slash if GET path is used!
export REACT_APP_WS_URL="wss://v2.postgres.ai/ai-bot-ws/" # we use staging for now, since dev env is not fullfledged yet
export REACT_APP_BOT_API_URL="https://v2.postgres.ai/ai-bot-api/bot"
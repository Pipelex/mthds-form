import { PipelexApiClient } from '@pipelex/sdk';

let client: PipelexApiClient | undefined;

/**
 * The one client the fixture harness's passes share.
 *
 * It reads `PIPELEX_API_KEY` and `PIPELEX_BASE_URL` (default
 * https://api.pipelex.com) from the environment through the SDK's own
 * defaults; nothing in this repo reads them itself. The SDK is a
 * devDependency, imported as a value here and nowhere under `src/`: lint
 * refuses the import there, and `make assert-bundle` refuses the specifier in
 * every built entry's graph. See docs/dependency-budget.md.
 */
export function getPipelexClient(): PipelexApiClient {
  if (!client) client = new PipelexApiClient();
  return client;
}

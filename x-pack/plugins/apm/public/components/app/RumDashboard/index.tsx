/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useMemo } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSpacer,
} from '@elastic/eui';
import { useTrackPageview } from '../../../../../observability/public';
import { Projection } from '../../../../common/projections';
import { RumDashboard } from './RumDashboard';
import { useUrlParams } from '../../../hooks/useUrlParams';
import { useFetcher } from '../../../hooks/useFetcher';
import { RUM_AGENT_NAMES } from '../../../../common/agent_name';
import { EnvironmentFilter } from '../../shared/EnvironmentFilter';
import { URLFilter } from './URLFilter';
import { LocalUIFilters } from '../../shared/LocalUIFilters';
import { ServiceNameFilter } from './URLFilter/ServiceNameFilter';

export function RumOverview() {
  useTrackPageview({ app: 'apm', path: 'rum_overview' });
  useTrackPageview({ app: 'apm', path: 'rum_overview', delay: 15000 });

  const localUIFiltersConfig = useMemo(() => {
    const config: React.ComponentProps<typeof LocalUIFilters> = {
      filterNames: ['location', 'device', 'os', 'browser'],
      projection: Projection.rumOverview,
    };

    return config;
  }, []);

  const {
    urlParams: { start, end },
  } = useUrlParams();

  const { data, status } = useFetcher(
    (callApmApi) => {
      if (start && end) {
        return callApmApi({
          pathname: '/api/apm/rum-client/services',
          params: {
            query: {
              start,
              end,
              uiFilters: JSON.stringify({ agentName: RUM_AGENT_NAMES }),
            },
          },
        });
      }
    },
    [start, end]
  );

  return (
    <>
      <EuiSpacer size="m" />
      <EuiFlexGroup>
        <EuiFlexItem grow={1}>
          <EnvironmentFilter />
          <EuiSpacer />

          <LocalUIFilters {...localUIFiltersConfig} showCount={true}>
            <>
              <ServiceNameFilter
                loading={status !== 'success'}
                serviceNames={data ?? []}
              />
              <EuiSpacer size="xl" />
              <URLFilter />
              <EuiHorizontalRule margin="none" />{' '}
            </>
          </LocalUIFilters>
        </EuiFlexItem>
        <EuiFlexItem grow={7}>
          <RumDashboard />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

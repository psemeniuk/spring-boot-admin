import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/vue';
import _ from 'lodash';

import { applications } from '../../../mocks/applications/data';

import Application from '@/services/application';
import Instance from '@/services/instance';
import { render } from '@/test-utils';
import Refresh from '@/views/instances/env/refresh';

// TODO: FIX ME!!!
describe('Refresh', () => {
  const refreshInstanceContext = jest.fn().mockResolvedValue({
    data: ['spring.redis.host', 'spring.datasource.url'],
  });

  const refreshApplicationContext = jest.fn().mockResolvedValue({
    data: [
      {
        instanceId: '123',
        status: 200,
        body: '["spring.redis.host","spring.datasource.url"]',
        contentType: 'application/json',
      },
      {
        instanceId: '456',
        status: 200,
        body: '["spring.redis.host","spring.datasource.url"]',
        contentType: 'application/json',
      },
    ],
  });

  function createInstance() {
    let instance = new Instance({ id: 1233 });
    instance.refreshContext = refreshInstanceContext;
    return instance;
  }

  function createApplication() {
    let application = new Application(_.cloneDeep(applications[1]));
    application.instances.push(createInstance());
    application.refreshContext = refreshApplicationContext;
    return application;
  }

  beforeEach(async () => {
    await render(Refresh, {
      props: {
        instance: createInstance(),
        application: createApplication(),
      },
    });
  });

  it('shows the changed configurations for the current instance', async () => {
    const refreshButton = await screen.findByText(
      'instances.env.context_refresh'
    );
    userEvent.click(refreshButton);

    const confirmButton = await screen.findByText('Confirm');
    userEvent.click(confirmButton);

    expect(screen.findByText('Refreshed configurations:')).toBeDefined();
    expect(screen.findByText('spring.redis.host')).toBeDefined();
    expect(screen.findByText('spring.datasource.url')).toBeDefined();
  });

  it('shows the changed configurations for all instances', async () => {
    const toggleScopeButton = await screen.getByRole('button', {
      name: 'Instance',
    });
    userEvent.click(toggleScopeButton);

    const refreshButton = await screen.findByText(
      'instances.env.context_refresh'
    );
    userEvent.click(refreshButton);

    const confirmButton = await screen.findByText('Confirm');
    userEvent.click(confirmButton);

    expect(screen.findByText('Refreshed configurations:')).toBeDefined();
    expect(screen.findByText('spring.redis.host')).toBeDefined();
    expect(screen.findByText('spring.datasource.url')).toBeDefined();
    expect(screen.findByText('instanceId: 123')).toBeDefined();
    expect(screen.findByText('instanceId: 456')).toBeDefined();
  });
});

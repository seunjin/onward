import { Controller, Get } from '@nestjs/common';

import { APP_NAME, SLOGAN } from '@onward/contracts';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      name: APP_NAME,
      slogan: SLOGAN,
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

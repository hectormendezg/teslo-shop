import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validRoles } from 'src/auth/interface/valid-roles';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(validRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }
}

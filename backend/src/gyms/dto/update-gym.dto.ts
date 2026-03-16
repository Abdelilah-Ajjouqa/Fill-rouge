import { PartialType } from '@nestjs/swagger';
import { CreateGymDto } from './create-gym.dto';

export class UpdateGymDto extends PartialType(CreateGymDto) {}

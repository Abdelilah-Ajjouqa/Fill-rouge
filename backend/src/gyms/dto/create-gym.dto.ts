import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

export class HallDto {
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Min(1)
  capacity: number;
}

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  logo?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HallDto)
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }

    let parsed = value;
    if (typeof value === 'string') {
      if (!value.trim()) {
        return [];
      }
      try {
        parsed = JSON.parse(value);
      } catch {
        return value;
      }
    }

    if (!Array.isArray(parsed)) {
      return parsed;
    }

    return plainToInstance(HallDto, parsed);
  }, { toClassOnly: true })
  halls?: HallDto[];
}

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/schemas/user.schema';

const logoStorage = diskStorage({
  destination: './uploads/logos',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('Gyms')
@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('logo', { storage: logoStorage }))
  @ApiOperation({ summary: 'Create a new gym with an optional logo upload' })
  create(
    @Body() createGymDto: CreateGymDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createGymDto.logo = `/uploads/logos/${file.filename}`;
    }
    return this.gymsService.create(createGymDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Retrieve all gyms' })
  findAll() {
    return this.gymsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Retrieve a specific gym by ID' })
  findOne(@Param('id') id: string) {
    return this.gymsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('logo', { storage: logoStorage }))
  @ApiOperation({ summary: 'Update a specific gym by ID' })
  update(
    @Param('id') id: string,
    @Body() updateGymDto: UpdateGymDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateGymDto.logo = `/uploads/logos/${file.filename}`;
    }
    return this.gymsService.update(id, updateGymDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a specific gym by ID' })
  remove(@Param('id') id: string) {
    return this.gymsService.remove(id);
  }
}

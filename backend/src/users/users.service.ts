import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...rest } = createUserDto;
        const passwordHash = await bcrypt.hash(password, 10);

        const createdUser = new this.userModel({
            ...rest,
            passwordHash,
        });
        return createdUser.save();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findOne(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findAll(): Promise<User[]>{
        return this.userModel.find();
    }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/roles.enum';
import { ValidateObjectIdPipe } from 'src/common/pipes/validate-object-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}
  
  // @Roles(Role.Admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: any) {
    const documents = await this.userService.findAll(query);
    return {
      status: 'success',
      message: `${documents.results} user(s) found`,
      data: documents.data,
    };
  }

  // @Roles(Role.Admin)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ValidateObjectIdPipe) id: string) {
    const user = await this.userService.findOne({ _id: id });
    return {
      status: 'success',
      data: { user },
    };
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateOne(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() updateUser: UpdateUserDTO,
  ) {
    const user = await this.userService.update(id, updateUser);
    return {
      status: 'success',
      message: 'User updated successfully!',
      data: { user },
    };
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async deleteOne(@Param('id', ValidateObjectIdPipe) id: string) {
    await this.userService.delete(id);
    return;
  }

  @Roles(Role.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async createUser(@Body() userDTO: CreateUserDTO) {
    const user = await this.userService.createUser(userDTO);
    return {
      status: 'success',
      message: 'New user created successfully!',
      data: { user },
    };
  }


  @HttpCode(HttpStatus.OK)
  @Post('/upload-profile')
  @UseInterceptors(
    FileInterceptor('profileImage'),
  )
  async uploadProfile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const imageUrl = await this.userService.uploadProfileImage(
      req.user.id,
      file,
    );
    return {
      status: 'success',
      message: 'Your profile Image has been uploaded successfully',
      imageUrl,
    };
  }

  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @Get('/addTenUsers')
  // async addTenUsers() {
  //   for (let i = 1; i <= 10; i++) {
  //     await this.userService.createUser({
  //       email: `user${i}@std.mans.edu.eg`,  
  //       password: `password${i}`,
  //       name: `User ${i}`,  
  //     })
  //   }
  //   return {
  //     status: 'success',
  //     message: '10 users added successfully!',
  //   };
  // }
  
}

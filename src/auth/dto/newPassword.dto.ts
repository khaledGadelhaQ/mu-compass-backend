import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class newPasswordDTO {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

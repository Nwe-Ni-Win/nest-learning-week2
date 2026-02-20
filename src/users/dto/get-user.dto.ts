import { IsOptional, IsEmail, IsString } from 'class-validator';

export class GetUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

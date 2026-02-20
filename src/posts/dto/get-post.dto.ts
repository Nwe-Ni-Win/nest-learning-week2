import { IsOptional, IsBoolean } from 'class-validator';

export class GetPostDto {
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

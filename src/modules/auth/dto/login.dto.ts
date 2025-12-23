import {
  IsEmail,
  IsString,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class UserDTO {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDate()
  emailVerifiedAt?: Date | null;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean | null;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  accounts?: GoogleSignInDTO[];
}

export class GoogleSignInDTO {
  @IsString()
  id: string;

  @IsString()
  userId: string;
  
  @IsString()
  providerId: string;

  @IsString()
  providerAccountId: string;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @IsOptional()
  @IsString()
  accessToken?: string | null;

  @IsOptional()
  @IsDate()
  accessTokenExpires?: Date | null;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  user: UserDTO;
}
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscoverCategory } from '../discover.types';

export class GetDiscoverDto {
    @IsOptional()
    @IsEnum(DiscoverCategory)
    category?: DiscoverCategory;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 30;
}

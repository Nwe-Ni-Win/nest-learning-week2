import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string | null;

  @Expose()
  published: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  author?: { name: string };

  @Expose()
  get authorName(): string | null {
    return this.author?.name ?? null;
  }
}

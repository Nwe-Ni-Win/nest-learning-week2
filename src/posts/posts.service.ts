import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { plainToInstance } from 'class-transformer';
import { GetPostDto } from './dto/get-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: number) {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
        author: {
          connect: { id: userId },
        },
      },
    });
    return `Post with ${post.title} is created successfully`;
  }

  async findAll(query: GetPostDto): Promise<PostDto[]> {
    const posts = await this.prisma.post.findMany({
      where:
        query.published !== undefined ? { published: query.published } : {},
      include: {
        author: {
          select: { name: true }, // only fetch author name
        },
      },
    });

    // ✅ Type-safe transformation
    const postDtos = plainToInstance<PostDto, (typeof posts)[number]>(
      PostDto,
      posts,
      {
        excludeExtraneousValues: true,
      },
    );

    return postDtos;
  }

  async findOne(id: number): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return plainToInstance(PostDto, post, { excludeExtraneousValues: true });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        title: updatePostDto.title,
        content: updatePostDto.content,
        published: updatePostDto.published,
      },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return { message: `Post with id ${id} updated successfully` };
  }

  async delete(id: number) {
    const post = await this.prisma.post.delete({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return { message: `Post with id ${id} deleted successfully` };
  }
}

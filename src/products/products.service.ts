import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  //==> loger personalizado
  private readonly logger = new Logger('ProductsService');

  //=> Utilizar el patron repositorio
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      // console.log(error);
      this.handleExeptionError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    /*  const product = await this.productRepository.find();
    return product; */
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      //===> relaciones
    });
  }

  async findOne(param: string) {
    /*  const product = await this.productRepository.findOneBy({ id });
    if (!product)
      throw new NotFoundException(`Product whit id ${id} not found`);
    return product; */
    let product: any = Product;
    if (isUUID(param)) {
      product = await this.productRepository.findOneBy({ id: param });
    } else {
      const query = this.productRepository.createQueryBuilder();
      product = await query
        .where('UPPER (title) =:title or slug =:slug', {
          title: param.toUpperCase(),
          slug: param.toLowerCase(),
        })
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`Product whit id ${param} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product)
      throw new NotFoundException(`Product whith id: ${id} not found`);

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleExeptionError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  //==> Menejador de errores
  private handleExeptionError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('A ocurrido un error!');
  }
}

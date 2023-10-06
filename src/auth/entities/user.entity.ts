import { Product } from 'src/products/entities/product.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  //===> Relacion de un a muchos con productos
  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  //===> Disparadores o triggers
  //Insertar correo electronico con minusculas

  @BeforeInsert()
  checkBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkBeforeUpdate() {
    this.checkBeforeInsert();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { DiscoverCategory } from './discover.types';

export type DiscoverArticleDocument = HydratedDocument<DiscoverArticle>;

@Schema({ timestamps: true, collection: 'discover_articles' })
export class DiscoverArticle extends Document {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ required: true })
    summary!: string;

    @Prop({ required: true })
    source!: string;

    /** Unique index to prevent duplicates at the DB level */
    @Prop({ required: true, unique: true })
    sourceUrl!: string;

    @Prop({ type: String, default: null })
    imageUrl!: string | null;

    @Prop({ type: String, enum: DiscoverCategory, index: true, required: true })
    category!: DiscoverCategory;

    @Prop({ required: true, type: Date })
    publishedAt!: Date;

    @Prop({ required: true })
    examRelevance!: string;

    @Prop({ required: true, type: Number })
    rankScore!: number;
}

export const DiscoverArticleSchema = SchemaFactory.createForClass(DiscoverArticle);

/**
 * Main query for the Discover feed:
 * "Get newest/highest ranked items in a given category"
 */
DiscoverArticleSchema.index({ category: 1, rankScore: -1, publishedAt: -1 });

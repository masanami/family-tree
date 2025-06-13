export interface Person {
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date?: Date | null;
  death_date?: Date | null;
  gender?: string | null;
  birth_place?: string | null;
  death_place?: string | null;
  occupation?: string | null;
  biography?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePersonDto {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date?: Date | null;
  death_date?: Date | null;
  gender?: string | null;
  birth_place?: string | null;
  death_place?: string | null;
  occupation?: string | null;
  biography?: string | null;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {}

export type RelationshipType = 'parent-child' | 'spouse' | 'sibling';

export interface FamilyRelationship {
  id: string;
  person1_id: string;
  person2_id: string;
  relationship_type: RelationshipType;
  start_date?: Date | null;
  end_date?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRelationshipDto {
  person1_id: string;
  person2_id: string;
  relationship_type: RelationshipType;
  start_date?: Date | null;
  end_date?: Date | null;
}

export interface UpdateRelationshipDto extends Partial<CreateRelationshipDto> {}
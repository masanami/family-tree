import pool from '../config/database';
import { FamilyRelationship, CreateRelationshipDto, UpdateRelationshipDto } from '../types/models';

export class RelationshipService {
  async getAllRelationships(): Promise<FamilyRelationship[]> {
    const query = `
      SELECT * FROM family_relationships
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getRelationshipById(id: string): Promise<FamilyRelationship | null> {
    const query = 'SELECT * FROM family_relationships WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getPersonRelationships(personId: string): Promise<FamilyRelationship[]> {
    const query = `
      SELECT * FROM family_relationships
      WHERE person1_id = $1 OR person2_id = $1
      ORDER BY relationship_type, created_at
    `;
    const result = await pool.query(query, [personId]);
    return result.rows;
  }

  async createRelationship(data: CreateRelationshipDto): Promise<FamilyRelationship> {
    // Validate that both persons exist
    const checkPersonsQuery = 'SELECT COUNT(*) FROM persons WHERE id IN ($1, $2)';
    const checkResult = await pool.query(checkPersonsQuery, [data.person1_id, data.person2_id]);
    
    if (parseInt(checkResult.rows[0].count) !== 2) {
      throw new Error('One or both persons do not exist');
    }

    // Create the relationship
    const query = `
      INSERT INTO family_relationships (
        person1_id, person2_id, relationship_type, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.person1_id,
      data.person2_id,
      data.relationship_type,
      data.start_date || null,
      data.end_date || null
    ];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This relationship already exists');
      }
      throw error;
    }
  }

  async updateRelationship(id: string, data: UpdateRelationshipDto): Promise<FamilyRelationship | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    // Only allow updating dates, not the persons or relationship type
    const allowedFields = ['start_date', 'end_date'];
    
    Object.entries(data).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getRelationshipById(id);
    }

    values.push(id);
    const query = `
      UPDATE family_relationships
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteRelationship(id: string): Promise<boolean> {
    const query = 'DELETE FROM family_relationships WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getRelationshipsByType(type: string): Promise<FamilyRelationship[]> {
    const query = `
      SELECT * FROM family_relationships
      WHERE relationship_type = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [type]);
    return result.rows;
  }

  async getChildren(parentId: string): Promise<string[]> {
    const query = `
      SELECT person2_id as child_id FROM family_relationships
      WHERE person1_id = $1 AND relationship_type = 'parent-child'
      UNION
      SELECT person1_id as child_id FROM family_relationships
      WHERE person2_id = $1 AND relationship_type = 'parent-child'
    `;
    const result = await pool.query(query, [parentId]);
    return result.rows.map(row => row.child_id);
  }

  async getParents(childId: string): Promise<string[]> {
    const query = `
      SELECT person1_id as parent_id FROM family_relationships
      WHERE person2_id = $1 AND relationship_type = 'parent-child'
      UNION
      SELECT person2_id as parent_id FROM family_relationships
      WHERE person1_id = $1 AND relationship_type = 'parent-child'
    `;
    const result = await pool.query(query, [childId]);
    return result.rows.map(row => row.parent_id);
  }

  async getSiblings(personId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT 
        CASE 
          WHEN fr1.person1_id = $1 THEN fr1.person2_id
          ELSE fr1.person1_id
        END as sibling_id
      FROM family_relationships fr1
      WHERE fr1.relationship_type = 'sibling'
        AND ($1 = fr1.person1_id OR $1 = fr1.person2_id)
    `;
    const result = await pool.query(query, [personId]);
    return result.rows.map(row => row.sibling_id);
  }

  async getSpouses(personId: string): Promise<string[]> {
    const query = `
      SELECT 
        CASE 
          WHEN person1_id = $1 THEN person2_id
          ELSE person1_id
        END as spouse_id
      FROM family_relationships
      WHERE relationship_type = 'spouse'
        AND ($1 = person1_id OR $1 = person2_id)
        AND (end_date IS NULL OR end_date > CURRENT_DATE)
    `;
    const result = await pool.query(query, [personId]);
    return result.rows.map(row => row.spouse_id);
  }
}
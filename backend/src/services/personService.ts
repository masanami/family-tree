import pool from '../config/database';
import { Person, CreatePersonDto, UpdatePersonDto } from '../types/models';

export class PersonService {
  async getAllPersons(): Promise<Person[]> {
    const query = `
      SELECT * FROM persons
      ORDER BY last_name, first_name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async getPersonById(id: string): Promise<Person | null> {
    const query = 'SELECT * FROM persons WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createPerson(data: CreatePersonDto): Promise<Person> {
    const query = `
      INSERT INTO persons (
        first_name, middle_name, last_name, birth_date, death_date,
        gender, birth_place, death_place, occupation, biography
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      data.first_name,
      data.middle_name || null,
      data.last_name,
      data.birth_date || null,
      data.death_date || null,
      data.gender || null,
      data.birth_place || null,
      data.death_place || null,
      data.occupation || null,
      data.biography || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updatePerson(id: string, data: UpdatePersonDto): Promise<Person | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getPersonById(id);
    }

    values.push(id);
    const query = `
      UPDATE persons
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deletePerson(id: string): Promise<boolean> {
    const query = 'DELETE FROM persons WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchPersons(searchTerm: string): Promise<Person[]> {
    const query = `
      SELECT * FROM persons
      WHERE 
        LOWER(first_name) LIKE LOWER($1) OR
        LOWER(middle_name) LIKE LOWER($1) OR
        LOWER(last_name) LIKE LOWER($1) OR
        LOWER(occupation) LIKE LOWER($1)
      ORDER BY last_name, first_name
    `;
    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}
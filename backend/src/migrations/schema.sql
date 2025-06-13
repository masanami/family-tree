-- Family Tree Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Persons table
CREATE TABLE IF NOT EXISTS persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    death_date DATE,
    gender VARCHAR(20),
    birth_place VARCHAR(255),
    death_place VARCHAR(255),
    occupation VARCHAR(255),
    biography TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (death_date IS NULL OR death_date >= birth_date)
);

-- Family relationships table
CREATE TABLE IF NOT EXISTS family_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person1_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    person2_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_different_persons CHECK (person1_id != person2_id),
    CONSTRAINT check_relationship_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT unique_relationship UNIQUE (person1_id, person2_id, relationship_type)
);

-- Relationship types: parent-child, spouse, sibling

-- Indexes for better query performance
CREATE INDEX idx_persons_last_name ON persons(last_name);
CREATE INDEX idx_persons_birth_date ON persons(birth_date);
CREATE INDEX idx_relationships_person1 ON family_relationships(person1_id);
CREATE INDEX idx_relationships_person2 ON family_relationships(person2_id);
CREATE INDEX idx_relationships_type ON family_relationships(relationship_type);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON family_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
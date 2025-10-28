const { Pool } = require("pg");
const logger = require("../utils/logger");

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      logger.info("PostgreSQL connected successfully");
      return true;
    } catch (error) {
      logger.error("Database connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      logger.info("Database connection closed");
    }
  }

  isConnected() {
    return this.pool !== null;
  }

  async initTables() {
    const createTablesSQL = `
      -- States table
      CREATE TABLE IF NOT EXISTS states (
        id SERIAL PRIMARY KEY,
        state_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Districts table
      CREATE TABLE IF NOT EXISTS districts (
        id SERIAL PRIMARY KEY,
        state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
        district_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(state_id, district_name)
      );

      -- MGNREGA data table
      CREATE TABLE IF NOT EXISTS mgnrega_data (
        id SERIAL PRIMARY KEY,
        state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
        district_id INTEGER REFERENCES districts(id) ON DELETE CASCADE,
        fin_year VARCHAR(20) NOT NULL,
        month VARCHAR(20) NOT NULL,
        
        -- Metrics
        total_job_cards_issued BIGINT DEFAULT 0,
        total_workers BIGINT DEFAULT 0,
        total_active_workers BIGINT DEFAULT 0,
        sc_workers BIGINT DEFAULT 0,
        st_workers BIGINT DEFAULT 0,
        total_women BIGINT DEFAULT 0,
        avg_days_employment DECIMAL(10,2) DEFAULT 0,
        hhs_completed_100_days BIGINT DEFAULT 0,
        total_households_worked BIGINT DEFAULT 0,
        total_individuals_worked BIGINT DEFAULT 0,
        differently_abled_worked BIGINT DEFAULT 0,
        number_of_gps BIGINT DEFAULT 0,
        total_expenditure DECIMAL(15,2) DEFAULT 0,
        wage_material_ratio VARCHAR(50),
        total_work_takenup BIGINT DEFAULT 0,
        number_of_ongoing_works BIGINT DEFAULT 0,
        number_of_completed_works BIGINT DEFAULT 0,
        
        -- Administrative
        total_administrative_expenditure DECIMAL(15,2) DEFAULT 0,
        total_number_persondays_generated BIGINT DEFAULT 0,
        persondays_generated_women BIGINT DEFAULT 0,
        persondays_generated_sc BIGINT DEFAULT 0,
        persondays_generated_st BIGINT DEFAULT 0,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(district_id, fin_year, month)
      );

      -- Indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_mgnrega_state ON mgnrega_data(state_id);
      CREATE INDEX IF NOT EXISTS idx_mgnrega_district ON mgnrega_data(district_id);
      CREATE INDEX IF NOT EXISTS idx_mgnrega_fin_year ON mgnrega_data(fin_year);
      CREATE INDEX IF NOT EXISTS idx_mgnrega_month ON mgnrega_data(month);
      CREATE INDEX IF NOT EXISTS idx_mgnrega_state_year ON mgnrega_data(state_id, fin_year);
      CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);

      -- Updated timestamp trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Apply trigger to tables
      DROP TRIGGER IF EXISTS update_states_updated_at ON states;
      CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_districts_updated_at ON districts;
      CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF NOT EXISTS update_mgnrega_updated_at ON mgnrega_data;
      CREATE TRIGGER update_mgnrega_updated_at BEFORE UPDATE ON mgnrega_data
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await this.pool.query(createTablesSQL);
      logger.info("Database tables created/verified successfully");
    } catch (error) {
      logger.error("Error creating tables:", error);
      throw error;
    }
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug(
        `Query executed in ${duration}ms: ${text.substring(0, 100)}`
      );
      return result;
    } catch (error) {
      logger.error("Query error:", error);
      throw error;
    }
  }

  // Helper methods
  async getStateByName(stateName) {
    const result = await this.query(
      "SELECT * FROM states WHERE UPPER(state_name) = UPPER($1)",
      [stateName]
    );
    return result.rows[0];
  }

  async createState(stateName) {
    const result = await this.query(
      "INSERT INTO states (state_name) VALUES ($1) ON CONFLICT (state_name) DO UPDATE SET state_name = EXCLUDED.state_name RETURNING *",
      [stateName]
    );
    return result.rows[0];
  }

  async getDistrictByName(stateId, districtName) {
    const result = await this.query(
      "SELECT * FROM districts WHERE state_id = $1 AND UPPER(district_name) = UPPER($2)",
      [stateId, districtName]
    );
    return result.rows[0];
  }

  async createDistrict(stateId, districtName) {
    const result = await this.query(
      "INSERT INTO districts (state_id, district_name) VALUES ($1, $2) ON CONFLICT (state_id, district_name) DO UPDATE SET district_name = EXCLUDED.district_name RETURNING *",
      [stateId, districtName]
    );
    return result.rows[0];
  }

  async upsertMGNREGAData(data) {
    const {
      district_id,
      fin_year,
      month,
      total_job_cards_issued,
      total_workers,
      total_active_workers,
      sc_workers,
      st_workers,
      total_women,
      avg_days_employment,
      hhs_completed_100_days,
      total_households_worked,
      total_individuals_worked,
      differently_abled_worked,
      number_of_gps,
      total_expenditure,
      wage_material_ratio,
      total_work_takenup,
      number_of_ongoing_works,
      number_of_completed_works,
      total_administrative_expenditure,
      total_number_persondays_generated,
      persondays_generated_women,
      persondays_generated_sc,
      persondays_generated_st,
    } = data;

    const result = await this.query(
      `INSERT INTO mgnrega_data (
        district_id, fin_year, month,
        total_job_cards_issued, total_workers, total_active_workers,
        sc_workers, st_workers, total_women,
        avg_days_employment, hhs_completed_100_days, total_households_worked,
        total_individuals_worked, differently_abled_worked, number_of_gps,
        total_expenditure, wage_material_ratio, total_work_takenup,
        number_of_ongoing_works, number_of_completed_works,
        total_administrative_expenditure, total_number_persondays_generated,
        persondays_generated_women, persondays_generated_sc, persondays_generated_st
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
      ON CONFLICT (district_id, fin_year, month)
      DO UPDATE SET
        total_job_cards_issued = EXCLUDED.total_job_cards_issued,
        total_workers = EXCLUDED.total_workers,
        total_active_workers = EXCLUDED.total_active_workers,
        sc_workers = EXCLUDED.sc_workers,
        st_workers = EXCLUDED.st_workers,
        total_women = EXCLUDED.total_women,
        avg_days_employment = EXCLUDED.avg_days_employment,
        hhs_completed_100_days = EXCLUDED.hhs_completed_100_days,
        total_households_worked = EXCLUDED.total_households_worked,
        total_individuals_worked = EXCLUDED.total_individuals_worked,
        differently_abled_worked = EXCLUDED.differently_abled_worked,
        number_of_gps = EXCLUDED.number_of_gps,
        total_expenditure = EXCLUDED.total_expenditure,
        wage_material_ratio = EXCLUDED.wage_material_ratio,
        total_work_takenup = EXCLUDED.total_work_takenup,
        number_of_ongoing_works = EXCLUDED.number_of_ongoing_works,
        number_of_completed_works = EXCLUDED.number_of_completed_works,
        total_administrative_expenditure = EXCLUDED.total_administrative_expenditure,
        total_number_persondays_generated = EXCLUDED.total_number_persondays_generated,
        persondays_generated_women = EXCLUDED.persondays_generated_women,
        persondays_generated_sc = EXCLUDED.persondays_generated_sc,
        persondays_generated_st = EXCLUDED.persondays_generated_st,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        district_id,
        fin_year,
        month,
        total_job_cards_issued,
        total_workers,
        total_active_workers,
        sc_workers,
        st_workers,
        total_women,
        avg_days_employment,
        hhs_completed_100_days,
        total_households_worked,
        total_individuals_worked,
        differently_abled_worked,
        number_of_gps,
        total_expenditure,
        wage_material_ratio,
        total_work_takenup,
        number_of_ongoing_works,
        number_of_completed_works,
        total_administrative_expenditure,
        total_number_persondays_generated,
        persondays_generated_women,
        persondays_generated_sc,
        persondays_generated_st,
      ]
    );
    return result.rows[0];
  }
}

const db = new Database();
module.exports = db;

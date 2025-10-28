const axios = require("axios");
const logger = require("../utils/logger");
const db = require("../db/database");

const GOV_API_URL =
  process.env.GOV_API_URL ||
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722";

// States to sync (add more as needed)
const STATES_TO_SYNC = [
  "MADHYA PRADESH",
  // Add more states here if needed
  // 'UTTAR PRADESH',
  // 'RAJASTHAN',
];

class SyncService {
  async fetchFromGovernmentAPI(state, finYear = null, month = "April") {
    try {
      const params = new URLSearchParams({
        "api-key": process.env.GOV_API_KEY || "",
        format: "json",
        "filters[state_name]": state,
        "filters[month]": month,
        limit: "500",
        offset: "0",
      });

      if (finYear) {
        params.append("filters[fin_year]", finYear);
      }

      const url = `${GOV_API_URL}?${params.toString()}`;
      logger.info(
        `Fetching data from government API: ${state}, ${month}, ${
          finYear || "all years"
        }`
      );

      const response = await axios.get(url, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          "User-Agent": "MGNREGA-Dashboard/1.0",
        },
      });

      if (response.data && response.data.records) {
        logger.info(
          `Fetched ${response.data.records.length} records for ${state}`
        );
        return response.data.records;
      }

      logger.warn(`No records found for ${state}`);
      return [];
    } catch (error) {
      logger.error(
        `Error fetching from government API for ${state}:`,
        error.message
      );
      throw error;
    }
  }

  async syncStateData(stateName) {
    try {
      logger.info(`Starting sync for state: ${stateName}`);

      // Fetch data from government API (April data for all available years)
      const records = await this.fetchFromGovernmentAPI(stateName);

      if (records.length === 0) {
        logger.warn(`No data to sync for ${stateName}`);
        return { state: stateName, synced: 0, errors: 0 };
      }

      // Get or create state
      let state = await db.getStateByName(stateName);
      if (!state) {
        state = await db.createState(stateName);
        logger.info(`Created new state: ${stateName}`);
      }

      let synced = 0;
      let errors = 0;

      // Process each record
      for (const record of records) {
        try {
          // Get or create district
          const districtName = record.district_name;
          if (!districtName) {
            logger.warn("Record missing district_name, skipping");
            errors++;
            continue;
          }

          let district = await db.getDistrictByName(state.id, districtName);
          if (!district) {
            district = await db.createDistrict(state.id, districtName);
            logger.debug(`Created new district: ${districtName}`);
          }

          // Upsert MGNREGA data
          const mgnregaData = {
            district_id: district.id,
            fin_year: record.fin_year || "Unknown",
            month: record.month || "April",
            total_job_cards_issued: parseInt(
              record.Total_No_of_JobCards_issued || 0
            ),
            total_workers: parseInt(record.Total_No_of_Workers || 0),
            total_active_workers: parseInt(
              record.Total_No_of_Active_Workers || 0
            ),
            sc_workers: parseInt(record.SC_workers_against_active_workers || 0),
            st_workers: parseInt(record.ST_workers_against_active_workers || 0),
            total_women: parseInt(
              record.Total_Women_out_of_active_workers || 0
            ),
            avg_days_employment: parseFloat(
              record.Average_days_of_employment_provided_per_Household || 0
            ),
            hhs_completed_100_days: parseInt(
              record.Number_of_HHs_completed_100_Days_of_Wage_employment || 0
            ),
            total_households_worked: parseInt(
              record.Total_No_of_HHs_worked || 0
            ),
            total_individuals_worked: parseInt(
              record.Total_No_of_Individuals_worked || 0
            ),
            differently_abled_worked: parseInt(
              record.No_of_Differently_abled_persons_worked || 0
            ),
            number_of_gps: parseInt(record.Number_of_GPs_with_NIL_exp || 0),
            total_expenditure: parseFloat(record.Total_Exp || 0),
            wage_material_ratio: record.Wage_material_ratio || "",
            total_work_takenup: parseInt(
              record.Total_No_of_Works_Takenup_New_Spill || 0
            ),
            number_of_ongoing_works: parseInt(
              record.Number_of_Ongoing_Works || 0
            ),
            number_of_completed_works: parseInt(
              record.Number_of_Completed_Works || 0
            ),
            total_administrative_expenditure: parseFloat(
              record.Total_Adm_Expenditure || 0
            ),
            total_number_persondays_generated: parseInt(
              record.Total_No_of_Persondays_Generated_so_far || 0
            ),
            persondays_generated_women: parseInt(
              record.Persondays_Generated_for_Women || 0
            ),
            persondays_generated_sc: parseInt(
              record.Persondays_Generated_for_SC || 0
            ),
            persondays_generated_st: parseInt(
              record.Persondays_Generated_for_ST || 0
            ),
          };

          await db.upsertMGNREGAData(mgnregaData);
          synced++;
        } catch (recordError) {
          logger.error(`Error processing record:`, recordError.message);
          errors++;
        }
      }

      logger.info(
        `Sync completed for ${stateName}: ${synced} records synced, ${errors} errors`
      );
      return { state: stateName, synced, errors };
    } catch (error) {
      logger.error(`Error syncing state data for ${stateName}:`, error);
      throw error;
    }
  }

  async syncAllStatesData() {
    logger.info("Starting sync for all states...");
    const results = [];

    for (const state of STATES_TO_SYNC) {
      try {
        const result = await this.syncStateData(state);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to sync ${state}:`, error.message);
        results.push({ state, synced: 0, errors: 1 });
      }
    }

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    logger.info(
      `All states sync completed: ${totalSynced} total records synced, ${totalErrors} total errors`
    );

    return results;
  }
}

const syncService = new SyncService();
module.exports = {
  syncStateData: (state) => syncService.syncStateData(state),
  syncAllStatesData: () => syncService.syncAllStatesData(),
};

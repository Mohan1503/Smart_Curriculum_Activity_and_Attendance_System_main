package com.management.smartclass.payload;

import java.util.Map;

public class DayGridDTO {

    // periodNumber → subject+faculty
    private Map<Integer, PeriodCellDTO> periods;

    public DayGridDTO(Map<Integer, PeriodCellDTO> periods) {
        this.periods = periods;

    }

    public DayGridDTO() {
    }

    public Map<Integer, PeriodCellDTO> getPeriods() {
        return periods;
    }

    public void setPeriods(Map<Integer, PeriodCellDTO> periods) {
        this.periods = periods;
    }
}


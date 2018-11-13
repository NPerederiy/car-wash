using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CarWash.Models;
using CarWash.Services;

namespace CarWash.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        [HttpGet, Route("options")]
        public GetWashOptionsResponse GetWashOptions()
        {
            return new GetWashOptionsResponse
            {
                WashOptions = _scheduleService.GetWashOptions()
            };
        }

        [HttpGet, Route("awailable-days")]
        //public IEnumerable<DateTime> GetAwailableDays([FromQuery]GetAwailableDaysRequest request)
        public IEnumerable<DateTime> GetAwailableDays([FromQuery(Name = "id")]List<int> id)
        {
            GetAwailableDaysRequest request = new GetAwailableDaysRequest()
            {
                WashOptions = _scheduleService.GetWashOptions().Where((e) => id.IndexOf(e.OptionID) != -1)
            };
            return _scheduleService.GetAwailableDays(request);
        }

        [HttpGet, Route("day-shedule")]
        //public GetScheduleForDayResponse GetSheduleForDay([FromQuery]GetScheduleForDayRequest request)
        public GetScheduleForDayResponse GetSheduleForDay([FromQuery(Name = "id")]List<int> id, [FromQuery(Name = "date")] string date)
        {
            GetScheduleForDayRequest request = new GetScheduleForDayRequest()
            {
                WashOptions = _scheduleService.GetWashOptions().Where((e) => id.IndexOf(e.OptionID) != -1),
                Date = DateTime.ParseExact(date, "dd.mm.yyyy", System.Globalization.CultureInfo.InvariantCulture)
            };
            return new GetScheduleForDayResponse
            {
                BoxShedules = _scheduleService.GetSheduleForDay(request)
            };
        }


        // GET: api/Shedule
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Shedule/5
        [HttpGet("{id}", Name = "Get")]
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Shedule
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/Shedule/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

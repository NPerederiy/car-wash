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
        public IEnumerable<DateTime> GetAwailableDays([FromQuery(Name = "id")]List<int> id)
        {
            GetAwailableDaysRequest request = new GetAwailableDaysRequest()
            {
                WashOptions = _scheduleService.GetWashOptions().Where(o => id.Contains(o.OptionID))
            };
            return _scheduleService.GetAwailableDays(request);
        }

        [HttpGet, Route("day-shedule")]
        public GetScheduleForDayResponse GetSheduleForDay([FromQuery(Name = "id")]List<int> id, [FromQuery(Name = "date")] string date)
        {
            GetScheduleForDayRequest request = new GetScheduleForDayRequest()
            {
                WashOptions = _scheduleService.GetWashOptions().Where((e) => id.IndexOf(e.OptionID) != -1),
                Date = DateTime.ParseExact(date, "yyyy.MM.dd", System.Globalization.CultureInfo.InvariantCulture)
            };
            return new GetScheduleForDayResponse
            {
                BoxShedules = _scheduleService.GetSheduleForDay(request)
            };
        }

        [HttpPost, Route("create-order")]
        public IActionResult CreateOrder(CreateOrderRequest request)
        {
            try
            {
                var orderID = _scheduleService.CreateOrder(request);
                return Ok(orderID);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex);
            }
        }
    }
}

@Configuration
@EnableAsync
@EnableScheduling
public class SchedulingConfiguration implements SchedulingConfigurer, ApplicationContextAware {
    private static final Logger log = LoggerFactory.getLogger(SchedulingConfiguration.class);

    private static ApplicationContext appCtx;

    private final ConcurrentMap<String, ScheduledTask> scheduledTaskHolder = new ConcurrentHashMap<>(16);

    private final ConcurrentMap<String, String> cronExpressionHolder = new ConcurrentHashMap<>(16);

    private ScheduledTaskRegistrar taskRegistrar;    
    
    public static synchronized void setAppCtx(ApplicationContext appCtx) {
        SchedulingConfiguration.appCtx = appCtx;
    }    
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        setAppCtx(applicationContext);
    }    
    
    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        this.taskRegistrar = taskRegistrar;
    }    
    
    /**
     * Refresh the timing task expressions
     */
    public void refresh() {
        Map<String, IPollableService> beanMap = appCtx.getBeansOfType(IPollableService.class);
        if (beanMap.isEmpty() || taskRegistrar == null) {
            return;
        }
        beanMap.forEach((beanName, task) -> {
            String expression = task.getCronExpression();
            String taskName = task.getTaskName();
            if (null == expression) {
                log.warn("The task expression for scheduled task [{}] is not configured or misconfigured, please check", taskName);
                return;
            }
            // If the strategy execution time has changed, cancel the current strategy task and re-register
            boolean unmodified = scheduledTaskHolder.containsKey(beanName) && cronExpressionHolder.get(beanName).equals(expression);
            if (unmodified) {
                log.info("The task expression for scheduled task [{}] has not changed, no refresh needed", taskName);
                return;
            }
            Optional.ofNullable(scheduledTaskHolder.remove(beanName)).ifPresent(existTask -> {
                existTask.cancel();
                cronExpressionHolder.remove(beanName);
            });
            if (ScheduledTaskRegistrar.CRON_DISABLED.equals(expression)) {
                log.warn("The task expression for scheduled task [{}] is configured to be disabled and will not be scheduled", taskName);
                return;
            }
            CronTask cronTask = new CronTask(task::poll, expression);
            ScheduledTask scheduledTask = taskRegistrar.scheduleCronTask(cronTask);
            if (scheduledTask != null) {
                log.info("Scheduled task [{}] has been loaded with the current expression [{}]", taskName, expression);
                scheduledTaskHolder.put(beanName, scheduledTask);
                cronExpressionHolder.put(beanName, expression);
            }
        });
    }
}
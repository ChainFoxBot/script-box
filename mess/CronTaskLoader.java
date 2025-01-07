@Component
public class CronTaskLoader implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(CronTaskLoader.class);
    private final SchedulingConfiguration schedulingConfiguration;
    private final AtomicBoolean appStarted = new AtomicBoolean(false);
    private final AtomicBoolean initializing = new AtomicBoolean(false);    
    
    public CronTaskLoader(SchedulingConfiguration schedulingConfiguration) {
        this.schedulingConfiguration = schedulingConfiguration;
    }    
    
    /**
     * Scheduled task configuration refresh
     */
    @Scheduled(fixedDelay = 5000)
    public void cronTaskConfigRefresh() {
        if (appStarted.get() && initializing.compareAndSet(false, true)) {
            log.info("Dynamic loading of scheduled tasks begins>>>>>>");
            try {
                schedulingConfiguration.refresh();
            } finally {
                initializing.set(false);
            }
            log.info("Dynamic loading of scheduled tasks ends<<<<<<");
        }
    }    
    
    @Override
    public void run(ApplicationArguments args) {
        if (appStarted.compareAndSet(false, true)) {
            cronTaskConfigRefresh();
        }
    }
}
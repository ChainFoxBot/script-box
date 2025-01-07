public interface IPollableService {
    /**
     * Execution method
     */
    void poll();    
    
    /**
     * Get the cycle expression
     *
     * @return CronExpression
     */
    default String getCronExpression() {
        return null;
    }   
    
     /**
     * Get the task name
     *
     * @return Task name
     */
    default String getTaskName() {
        return this.getClass().getSimpleName();
    }
}
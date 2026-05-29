class HealthHandler {
  constructor() {
    this.getHealthHandler = this.getHealthHandler.bind(this);
  }

  getHealthHandler(req, res) {
    res.status(200).json({
      status: 'success',
      message: 'Forum API is healthy',
    });
  }
}

export default HealthHandler;
